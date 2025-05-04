import select from "@inquirer/select";
const fs = require("fs");
const path = require("path");
const https = require("https");

/**
 * Prompts the user for a license and generates the LICENSE file in the monorepo.
 */
export async function promptAndGenerateLicense(monorepoPath: string): Promise<void> {
  const licenseChoices = [
    { name: "MIT", value: "mit" },
    { name: "Apache 2.0", value: "apache-2.0" },
    { name: "GPL v3.0", value: "gpl-3.0" },
    { name: "BSD 3-Clause", value: "bsd-3-clause" },
    { name: "MPL 2.0", value: "mpl-2.0" },
    { name: "Unlicense", value: "unlicense" },
    { name: "None", value: "" },
  ];
  const licenseKey = await select({
    message: "Choose a license to add to the project (optional):",
    choices: licenseChoices.map((l) => ({ name: l.name, value: l.value })),
    default: "mit",
  });

  if (licenseKey) {
    const licenseUrl = `https://api.github.com/licenses/${licenseKey}`;
    const licenseText = await new Promise<string>((resolve, reject) => {
      https.get(
        licenseUrl,
        {
          headers: {
            "User-Agent": "project-generator",
            "Accept": "application/vnd.github.v3+json",
          },
        },
        (res: import("http").IncomingMessage) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              if (json.body) {
                resolve(json.body);
              } else {
                reject(
                  new Error("License text not found in GitHub API response.")
                );
              }
            } catch (e) {
              reject(e);
            }
          });
        }
      ).on("error", reject);
    });
    fs.writeFileSync(path.join(monorepoPath, "LICENSE"), licenseText, "utf8");
    console.log(`LICENSE file created with ${licenseKey.toUpperCase()} license.`);
  } else {
    console.log("No license selected. Skipping LICENSE file creation.");
  }
}
