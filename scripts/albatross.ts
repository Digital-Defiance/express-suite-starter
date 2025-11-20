import { getStarterTranslation, StarterStringKey } from '../src/i18n';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';

// Read version from package.json
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
export const STARTER_VERSION = packageJson.version;

export function printBanner(): void {
    console.log(`
\u001b[48;5;116m                                                \u001b[m
\u001b[48;5;116m                                                \u001b[m
\u001b[48;5;116m                                                \u001b[m
\u001b[48;5;116m                                                \u001b[m
\u001b[48;5;116m                            \u001b[38;5;254;48;5;152m▄\u001b[48;5;15m    \u001b[38;5;15;48;5;254m▄\u001b[38;5;255;48;5;152m▄\u001b[38;5;250;48;5;116m▄\u001b[48;5;116m            \u001b[m
\u001b[48;5;116m                           \u001b[38;5;255;48;5;116m▄\u001b[48;5;15m   \u001b[38;5;15;48;5;240m▄▄\u001b[48;5;15m \u001b[38;5;187;48;5;223m▄\u001b[38;5;130;48;5;166m▄\u001b[38;5;166;48;5;167m▄▄▄▄\u001b[48;5;116m        \u001b[m
\u001b[48;5;116m                           \u001b[48;5;255m \u001b[48;5;15m    \u001b[38;5;255;48;5;15m▄▄\u001b[38;5;254;48;5;255m▄\u001b[38;5;116;48;5;116m▄\u001b[48;5;116m            \u001b[m
\u001b[48;5;116m                          \u001b[38;5;152;48;5;116m▄\u001b[38;5;15;48;5;255m▄\u001b[48;5;15m    \u001b[38;5;15;48;5;255m▄\u001b[38;5;255;48;5;255m▄\u001b[48;5;254m \u001b[48;5;116m             \u001b[m
\u001b[48;5;116m            \u001b[38;5;116;48;5;116m▄\u001b[38;5;247;48;5;116m▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[38;5;251;48;5;255m▄\u001b[48;5;15m      \u001b[38;5;15;48;5;255m▄\u001b[48;5;254m \u001b[48;5;116m             \u001b[m
\u001b[48;5;116m         \u001b[38;5;242;48;5;116m▄\u001b[38;5;237;48;5;116m▄\u001b[38;5;237;48;5;238m▄▄\u001b[48;5;237m             \u001b[38;5;237;48;5;237m▄\u001b[38;5;237;48;5;252m▄\u001b[38;5;249;48;5;15m▄\u001b[48;5;15m     \u001b[38;5;255;48;5;254m▄\u001b[48;5;116m             \u001b[m
\u001b[48;5;116m    \u001b[38;5;109;48;5;109m▄\u001b[38;5;242;48;5;243m▄\u001b[38;5;237;48;5;109m▄▄\u001b[38;5;237;48;5;236m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;236;48;5;237m▄▄▄\u001b[48;5;237m                \u001b[48;5;15m     \u001b[48;5;255m \u001b[48;5;116m             \u001b[m
\u001b[48;5;116m      \u001b[38;5;116;48;5;66m▄\u001b[38;5;116;48;5;238m▄\u001b[38;5;246;48;5;237m▄\u001b[38;5;239;48;5;237m▄\u001b[38;5;239;48;5;236m▄\u001b[38;5;237;48;5;236m▄▄\u001b[38;5;241;48;5;236m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;236;48;5;236m▄▄\u001b[38;5;236;48;5;237m▄▄▄▄\u001b[38;5;237;48;5;237m▄▄▄▄▄▄\u001b[38;5;188;48;5;237m▄\u001b[38;5;15;48;5;251m▄\u001b[48;5;15m     \u001b[38;5;15;48;5;255m▄\u001b[38;5;152;48;5;116m▄\u001b[48;5;116m            \u001b[m
\u001b[48;5;116m           \u001b[38;5;116;48;5;109m▄\u001b[38;5;116;48;5;253m▄\u001b[38;5;255;48;5;255m▄\u001b[38;5;15;48;5;255m▄\u001b[38;5;15;48;5;188m▄\u001b[38;5;15;48;5;236m▄\u001b[38;5;248;48;5;236m▄\u001b[38;5;245;48;5;236m▄\u001b[48;5;236m      \u001b[38;5;240;48;5;236m▄\u001b[38;5;15;48;5;253m▄\u001b[48;5;15m       \u001b[38;5;255;48;5;255m▄\u001b[38;5;116;48;5;116m▄\u001b[48;5;116m            \u001b[m
\u001b[48;5;116m              \u001b[38;5;152;48;5;254m▄\u001b[38;5;254;48;5;15m▄\u001b[38;5;255;48;5;15m▄▄\u001b[38;5;15;48;5;15m▄\u001b[48;5;15m \u001b[38;5;15;48;5;238m▄\u001b[38;5;252;48;5;236m▄\u001b[38;5;251;48;5;236m▄▄\u001b[38;5;255;48;5;238m▄\u001b[48;5;15m        \u001b[38;5;152;48;5;255m▄\u001b[48;5;116m              \u001b[m
\u001b[48;5;116m               \u001b[38;5;116;48;5;116m▄\u001b[38;5;116;48;5;188m▄\u001b[38;5;116;48;5;254m▄\u001b[38;5;254;48;5;254m▄▄\u001b[38;5;254;48;5;255m▄▄\u001b[38;5;255;48;5;255m▄\u001b[48;5;15m       \u001b[38;5;15;48;5;15m▄\u001b[38;5;116;48;5;255m▄\u001b[38;5;116;48;5;152m▄\u001b[48;5;116m               \u001b[m
\u001b[48;5;116m                   \u001b[38;5;116;48;5;152m▄\u001b[38;5;152;48;5;152m▄\u001b[38;5;251;48;5;254m▄\u001b[38;5;254;48;5;255m▄\u001b[48;5;15m    \u001b[38;5;255;48;5;15m▄\u001b[38;5;116;48;5;15m▄\u001b[38;5;116;48;5;152m▄▄\u001b[48;5;116m                 \u001b[m
\u001b[48;5;116m                     \u001b[38;5;116;48;5;251m▄\u001b[38;5;188;48;5;254m▄\u001b[48;5;15m  \u001b[38;5;255;48;5;15m▄\u001b[38;5;116;48;5;255m▄\u001b[38;5;116;48;5;116m▄\u001b[48;5;116m                    \u001b[m
\u001b[48;5;116m                      \u001b[38;5;116;48;5;109m▄\u001b[38;5;8;48;5;102m▄\u001b[38;5;246;48;5;248m▄\u001b[38;5;250;48;5;116m▄\u001b[48;5;116m                      \u001b[m
\u001b[48;5;116m              \u001b[38;5;116;48;5;116m▄\u001b[38;5;109;48;5;116m▄▄▄▄▄▄▄▄\u001b[38;5;109;48;5;247m▄\u001b[38;5;246;48;5;245m▄\u001b[38;5;247;48;5;246m▄\u001b[38;5;8;48;5;8m▄▄\u001b[38;5;8;48;5;245m▄\u001b[38;5;109;48;5;109m▄\u001b[38;5;109;48;5;116m▄▄▄▄▄\u001b[38;5;116;48;5;116m▄▄\u001b[48;5;116m           \u001b[m
\u001b[48;5;116m              \u001b[38;5;116;48;5;109m▄▄\u001b[48;5;109m         \u001b[38;5;109;48;5;109m▄\u001b[38;5;109;48;5;248m▄▄▄▄▄\u001b[38;5;109;48;5;109m▄\u001b[48;5;109m  \u001b[38;5;110;48;5;109m▄\u001b[38;5;116;48;5;109m▄\u001b[38;5;116;48;5;116m▄\u001b[48;5;116m           \u001b[m
\u001b[48;5;116m                   \u001b[38;5;116;48;5;110m▄▄▄▄▄▄▄▄▄▄▄▄\u001b[38;5;116;48;5;116m▄\u001b[48;5;116m                \u001b[m
\u001b[48;5;116m                                                \u001b[m
\u001b[48;5;116m                                                \u001b[m
\u001b[48;5;116m                                                \u001b[m
`);
}
export function printIntro(): void {
    const title = getStarterTranslation(StarterStringKey.STARTER_TITLE);
    const subTitle = getStarterTranslation(StarterStringKey.STARTER_SUBTITLE);
    const description = getStarterTranslation(StarterStringKey.STARTER_DESCRIPTION);
    const boxWidth = 79;
    const contentWidth = boxWidth - 4; // Account for '║ ' and ' ║'
    const titleLine = `${title} v${STARTER_VERSION}`;
    const titlePadding = ' '.repeat(Math.max(0, contentWidth - titleLine.length));
    const subTitlePadding = ' '.repeat(Math.max(0, contentWidth - subTitle.length));
    
    const wrappedLines = wrapText(description, contentWidth);
    const descriptionLines = wrappedLines.map(line => 
        chalk.bold.cyan('║ ') + chalk.gray(line) + chalk.bold.cyan(' ║')
    ).join('\n');
    
    console.log(
        '\n' +
        chalk.bold.cyan('╔' + '═'.repeat(boxWidth - 2) + '╗') + '\n' +
        chalk.bold.cyan('║ ') + chalk.bold.white(title) + chalk.bold.yellow(` v${STARTER_VERSION}`) + titlePadding + chalk.bold.cyan(' ║') + '\n' +
        chalk.bold.cyan('║ ') + chalk.italic.gray(subTitle) + subTitlePadding + chalk.bold.cyan(' ║') + '\n' +
        chalk.bold.cyan('╠' + '═'.repeat(boxWidth - 2) + '╣') + '\n' +
        descriptionLines + '\n' +
        chalk.bold.cyan('╚' + '═'.repeat(boxWidth - 2) + '╝') + '\n'
    );
}

function wrapText(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= width) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine.padEnd(width));
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine.padEnd(width));
    return lines;
}