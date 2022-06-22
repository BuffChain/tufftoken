// SPDX-License-Identifier: agpl-3.0

const caller = require('caller');
import path from "path";

let recognizedVersions: string[] = [];

export function log(message: string) {
    //Get the version from the caller's filename
    const callerFilename = path.parse(caller()).base;
    const deployVersion = callerFilename.split('_')[0];

    if (!recognizedVersions.includes(deployVersion)) {
        console.log("🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸")
        recognizedVersions.push(deployVersion);
    }

    console.log(`[DEPLOY][v${deployVersion}] - ${message}`);
}
