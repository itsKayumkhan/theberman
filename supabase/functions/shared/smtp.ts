/// <reference lib="deno.ns" />

export class CustomSmtpClient {
    private conn: Deno.Conn | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private encoder = new TextEncoder();
    private decoder = new TextDecoder();

    async connect(hostname: string, port: number) {
        console.log(`[SMTP] Connecting to ${hostname}:${port}...`);
        this.conn = await Deno.connect({ hostname, port });
        this.reader = this.conn.readable.getReader();
        await this.readResponse();

        await this.command("EHLO localhost");

        if (port !== 465) {
            console.log("[SMTP] Issuing STARTTLS...");
            await this.command("STARTTLS");
            if (this.reader) this.reader.releaseLock();
            if (!this.conn) throw new Error("Connection lost during STARTTLS");
            const tlsConn = await Deno.startTls(this.conn, { hostname });
            this.conn = tlsConn;
            this.reader = this.conn.readable.getReader();
            await this.command("EHLO localhost");
        }
    }

    async authenticate(user: string, pass: string) {
        await this.command("AUTH LOGIN");
        await this.command(btoa(user));
        await this.command(btoa(pass));
    }

    async send(from: string, to: string, subject: string, html: string) {
        await this.command(`MAIL FROM:<${from.match(/<(.+)>/)?.[1] || from}>`);
        await this.command(`RCPT TO:<${to.match(/<(.+)>/)?.[1] || to}>`);
        await this.command("DATA");

        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/html; charset=UTF-8`,
            `MIME-Version: 1.0`,
            "",
            html,
            "\r\n."
        ].join("\r\n");

        await this.command(message);
    }

    async close() {
        if (this.conn) {
            try { await this.command("QUIT"); } catch (e) { }
            this.conn.close();
            this.conn = null;
            this.reader = null;
        }
    }

    private async command(cmd: string) {
        if (!this.conn) throw new Error("SMTP: Not connected");
        await this.conn.write(this.encoder.encode(cmd + "\r\n"));
        return await this.readResponse();
    }

    private async readResponse() {
        if (!this.reader) throw new Error("SMTP: Reader not initialized");

        let fullResponse = "";
        while (true) {
            const { value } = await this.reader.read();
            if (!value) throw new Error("SMTP: Connection closed by server");

            const chunk = this.decoder.decode(value);
            fullResponse += chunk;

            // SMTP lines end with \r\n. The last line of a response has a space after the code (e.g., "250 ")
            // multi-line responses have a dash (e.g., "250-")
            const lines = fullResponse.trim().split("\r\n");
            const lastLine = lines[lines.length - 1];

            if (lastLine && /^\d{3} /.test(lastLine)) {
                break;
            }
        }

        if (fullResponse.startsWith("4") || fullResponse.startsWith("5")) {
            throw new Error(`SMTP Error: ${fullResponse.trim()}`);
        }
        return fullResponse;
    }
}
