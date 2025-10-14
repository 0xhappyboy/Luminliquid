pub struct Network<'a> {
    pub name: &'a str,
}

/// background thread data structure, interact with the UI thread through this data structure.
#[derive(Debug)]
pub struct BackgroundThreadData {
    pub a: u64,
}

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
