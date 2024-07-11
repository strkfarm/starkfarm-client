import fs from "fs";
import { version } from './package.json';

// write changelog to CHANGELOG.md
// fs.writeFileSync("CHANGELOG.md", changelogContent);

// Update current version in README
fs.readFile("README.md", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const updatedReadme = data.replace(/CURRENT_VERSION_PLACEHOLDER/g, version);
  fs.writeFile("README.md", updatedReadme, "utf8", (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("README updated with current version");
  });
});
