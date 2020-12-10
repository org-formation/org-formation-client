

const zeroPad = (num: number, places: number): string => String(num).padStart(places, '0');

export class ResourceUtil {
    public static FixVersions(obj: any): void {
        if (obj !== null && typeof obj === 'object') {
            const entries = Object.entries(obj);
            for (const [key, val] of entries) {
                if (key === 'Version' && val instanceof Date) {
                    obj.Version = ResourceUtil.ToVersion(val);
                } else if (key === 'Version' && typeof val === 'string' && val.endsWith('T00:00:00.000Z')) {
                    obj.Version = val.substring(0, val.indexOf('T'));
                }
                if (val !== null && typeof val === 'object') {
                    this.FixVersions(val);
                }
            }
        }
    }

    public static ToVersion(date: Date): string {
        const year = date.getUTCFullYear();
        const month = zeroPad(1 + date.getUTCMonth(), 2);
        const day = zeroPad(date.getUTCDate(), 2);
        return `${year}-${month}-${day}`;
    }
}
