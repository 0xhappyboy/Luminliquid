use std::collections::HashMap;

use lazy_static::lazy_static;

/// i18n type enum
#[derive(Debug, Clone)]
pub enum I18N {
    EN,
    zhCN,
}

impl I18N {
    pub fn get(i18n: I18N, k: &str) -> String {
        if I18N_MAP.contains_key(k) {
            match i18n {
                I18N::EN => I18N_MAP.get(k).unwrap().0.to_string(),
                I18N::zhCN => I18N_MAP.get(k).unwrap().1.to_string(),
            }
        } else {
            return "key does not exist.".to_string();
        }
    }
}

lazy_static! {
    pub static ref I18N_MAP: HashMap<&'static str, (&'static str, &'static str)> = {
        let mut map = HashMap::new();
        map.insert("success", ("Success", "成功"));
        map.insert("fail", ("Fail", "失败"));
        map.insert("awaid-confirmed", ("awaid confirmed", "待确认"));
        map
    };
}
