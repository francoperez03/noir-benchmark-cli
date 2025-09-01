// Simple hash circuit for benchmarking
// Uses blake2s since it's available in Noir standard library

use dep::std;

fn main(preimage: [u8; 32]) -> pub [u8; 32] {
    // Use blake2s hash function (available in std library)
    let hash_result = std::hash::blake2s(preimage);
    hash_result
}

#[test]
fn test_simple_hash() {
    let preimage = [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
        0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f
    ];
    
    let result = main(preimage);
    
    // The result should be a 32-byte hash
    assert(result.len() == 32);
}