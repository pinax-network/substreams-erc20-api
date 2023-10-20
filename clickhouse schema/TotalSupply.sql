CREATE TABLE IF NOT EXISTS TotalSupply  (
    address FixedString(40),
    supply UInt256,
)
ENGINE = MergeTree()
ORDER BY (address)