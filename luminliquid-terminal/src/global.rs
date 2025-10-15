use std::sync::atomic::AtomicBool;

use crate::types::Network;
use lazy_static::lazy_static;

/// support network list
pub const SUPPORT_NETWORK_LIST: [Network; 7] = [
    Network { name: "Ethereum" },
    Network { name: "Solana" },
    Network { name: "Bsc" },
    Network { name: "Base" },
    Network { name: "Aptos" },
    Network { name: "Sui" },
    Network { name: "HyperEvm" },
];

/// support dex list
pub const SUPPORT_DEX_LIST: [&str; 4] = ["Uniswap", "Pancakeswap", "Raydium", "Orca"];

/// support network list
pub const SUPPORT_CEX_LIST: [&str; 6] =
    ["Binance", "Coinbase", "Bybite", "Bitget", "Kraken", "Okx"];

lazy_static! {
    /// application close flag
    pub static ref APPLICETION_CLOSE_FLAG: AtomicBool = AtomicBool::new(false);
}
