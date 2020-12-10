

export class ConsoleUtil {

    public static verbose = false;
    public static colorizeLogs = true;

    public static LogDebug(message: string): void {
        console.debug(`DEBG: ${message}`);
    }

    public static Out(message: string): void {
        console.log(message);
    }

    public static LogInfo(message: string): void {
        console.log(`INFO: ${message}`);
    }

    public static LogWarning(message: string): void {
        const formatted = `WARN: ${message}`;
        console.warn(yellow(formatted));
    }

    public static LogError(message: string, err?: Error): void {
        const formatted = `ERROR: ${message}`;
        console.error(red(formatted));
    }
}

const red = (message: string): string => {
    return ConsoleUtil.colorizeLogs ? `\x1b[31m${message}\x1b[0m` : message;
};

const yellow = (message: string): string => {
    return ConsoleUtil.colorizeLogs ? `\x1b[33m${message}\x1b[0m` : message;
};
