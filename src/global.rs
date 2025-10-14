use std::sync::{Arc, atomic::AtomicBool};

use crate::types::Network;
use lazy_static::lazy_static;

/// network list
pub const NETWORK_LIST: [Network; 7] = [
    Network { name: "Ethereum" },
    Network { name: "Solana" },
    Network { name: "Bsc" },
    Network { name: "Base" },
    Network { name: "Aptos" },
    Network { name: "Sui" },
    Network { name: "HyperEvm" },
];

lazy_static! {
    /// application close flag
    pub static ref APPLICETION_CLOSE_FLAG: AtomicBool = AtomicBool::new(false);
}
