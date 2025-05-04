/**
 * Obfuscates a string for password generation by randomly replacing certain characters
 * with symbol equivalents. Only some characters are replaced, so the result is partially
 * obfuscated and still recognizable.
 *
 * Example mappings:
 *   S -> 5, A -> @, C -> (, I -> !, O -> 0, E -> 3, T -> 7, B -> 8, G -> 6, Z -> 2
 *
 * @param input The string to obfuscate (e.g., project name)
 * @param probability Probability (0-1) to obfuscate each eligible character (default: 0.5)
 * @returns Obfuscated string
 */
export function obfuscatePassword(input: string, probability = 0.5): string {
  const map: Record<string, string> = {
    'A': '@',
    'B': '8',
    'C': '(',
    'D': ')',
    'E': '3',
    'G': '6',
    'H': '#',
    'I': '!',
    'L': '1',
    'O': '0',
    'S': '$',
    'T': '7',
    'Z': '2',
    'a': '@',
    'b': '6',
    'c': '(',
    'd': ')',
    'e': '3',
    'g': '6',
    'h': '#',
    'i': '!',
    'l': '1',
    'o': '0',
    's': '$',
    't': '7',
    'z': '2',
  };

  return Array.from(input).map(char => {
    if (map[char] && Math.random() < probability) {
      return map[char];
    }
    return char;
  }).join('');
}
