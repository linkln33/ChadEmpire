/**
 * Utility functions for handling Solana addresses
 */

/**
 * Shortens a Solana address for display purposes
 * @param address The full Solana address
 * @param chars Number of characters to show at start and end
 * @returns Shortened address with ellipsis in the middle
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
