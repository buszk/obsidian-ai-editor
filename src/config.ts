import { existsSync } from "fs";
import { join } from "path";

export enum Mode {
	PROD,
	TEST,
}

export let mode = Mode.PROD;

const TEST_MODE_FILE = join(
	process.env.HOME || process.env.USERPROFILE || "",
	".test_mode"
);
export function is_test_mode(): boolean {
	return existsSync(TEST_MODE_FILE);
}
