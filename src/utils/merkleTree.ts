import { keccak_256 } from 'js-sha3';

/**
 * Simple Merkle Tree implementation for whitelist verification
 * In production, you would use a more robust library like merkletreejs
 */

export interface WhitelistEntry {
  address: string;
  tier: number;
  maxAllocation: number;
}

export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(entries: WhitelistEntry[]) {
    // Create leaf nodes by hashing each entry
    this.leaves = entries.map(entry => this.hashEntry(entry));
    this.layers = [this.leaves];
    
    // Build the Merkle tree
    this.buildTree();
  }

  private hashEntry(entry: WhitelistEntry): string {
    // Hash the address and tier together
    const data = `${entry.address.toLowerCase()}:${entry.tier}:${entry.maxAllocation}`;
    return '0x' + keccak_256(data);
  }

  private buildTree(): void {
    // Build the tree bottom-up
    let currentLayer = this.leaves;
    
    // Continue until we reach the root (a single hash)
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      
      // Process pairs of nodes
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          // Hash the pair of nodes
          const combined = this.hashPair(currentLayer[i], currentLayer[i + 1]);
          nextLayer.push(combined);
        } else {
          // Odd number of nodes, promote the last one
          nextLayer.push(currentLayer[i]);
        }
      }
      
      // Add the new layer to our tree
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  private hashPair(left: string, right: string): string {
    // Sort the hashes to ensure consistent results
    const [first, second] = left < right ? [left, right] : [right, left];
    const combined = first.slice(2) + second.slice(2); // Remove '0x' prefix
    return '0x' + keccak_256(combined);
  }

  public getRoot(): string {
    // The root is the last hash in the last layer
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(entry: WhitelistEntry): string[] {
    const leaf = this.hashEntry(entry);
    const proof: string[] = [];
    
    // Find the leaf in the bottom layer
    let index = this.leaves.indexOf(leaf);
    if (index === -1) {
      throw new Error('Entry not found in the Merkle tree');
    }
    
    // Build the proof by traversing up the tree
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = index % 2 === 0;
      const siblingIndex = isRight ? index + 1 : index - 1;
      
      // If sibling exists, add it to the proof
      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }
      
      // Move up to the next layer
      index = Math.floor(index / 2);
    }
    
    return proof;
  }

  public verify(entry: WhitelistEntry, proof: string[]): boolean {
    let hash = this.hashEntry(entry);
    
    for (const proofElement of proof) {
      hash = this.hashPair(hash, proofElement);
    }
    
    return hash === this.getRoot();
  }
}

/**
 * Helper functions for whitelist management
 */

// Generate a Merkle tree from a list of whitelist entries
export function generateMerkleTree(entries: WhitelistEntry[]): MerkleTree {
  return new MerkleTree(entries);
}

// Merge snapshot data with manual whitelist entries
export function mergeWhitelists(
  snapshotEntries: WhitelistEntry[],
  manualEntries: WhitelistEntry[]
): WhitelistEntry[] {
  // Create a map of addresses to entries
  const entriesMap = new Map<string, WhitelistEntry>();
  
  // Add snapshot entries to the map
  for (const entry of snapshotEntries) {
    entriesMap.set(entry.address.toLowerCase(), entry);
  }
  
  // Add or override with manual entries
  for (const entry of manualEntries) {
    entriesMap.set(entry.address.toLowerCase(), entry);
  }
  
  // Convert map back to array
  return Array.from(entriesMap.values());
}

// Mock function to generate sample whitelist data
export function generateMockWhitelistData(count: number): WhitelistEntry[] {
  const entries: WhitelistEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a random Solana-like address
    const address = 'So1' + Array(40).fill(0).map(() => 
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[
        Math.floor(Math.random() * 62)
      ]
    ).join('');
    
    // Assign a random tier (1-5)
    const tier = Math.floor(Math.random() * 5) + 1;
    
    // Set max allocation based on tier
    const maxAllocation = tier === 1 ? 50 :
                         tier === 2 ? 30 :
                         tier === 3 ? 20 :
                         tier === 4 ? 10 : 5;
    
    entries.push({ address, tier, maxAllocation });
  }
  
  return entries;
}
