use crate::types::Network;

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

/// network enum
#[derive(Debug, Clone, PartialEq)]
pub enum NetworkEnum {
    Ethereum,
    Solana,
    Bsc,
    Base,
    Aptos,
    Sui,
    HyperEvm,
}

impl NetworkEnum {
    pub fn as_str(&self) -> &'static str {
        match self {
            NetworkEnum::Ethereum => "Ethereum",
            NetworkEnum::Solana => "Solana",
            NetworkEnum::Bsc => "Bsc",
            NetworkEnum::Base => "Base",
            NetworkEnum::Aptos => "Aptos",
            NetworkEnum::Sui => "Sui",
            NetworkEnum::HyperEvm => "HyperEvm",
        }
    }
    pub fn all_vec() -> Vec<NetworkEnum> {
        vec![
            NetworkEnum::Ethereum,
            NetworkEnum::Solana,
            NetworkEnum::Bsc,
            NetworkEnum::Base,
            NetworkEnum::Aptos,
            NetworkEnum::Sui,
            NetworkEnum::HyperEvm,
        ]
    }
}
