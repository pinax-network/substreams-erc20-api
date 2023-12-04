CREATE TABLE IF NOT EXISTS TotalSupply  (
    chain           LowCardinality(String),
    block_number    UInt32(),
    timestamp       DateTime64(3, 'UTC'),
    address FixedString(40),
    supply UInt256,
)
ENGINE = MergeTree()
ORDER BY (timestamp, address, block_number, chain)

-- Indexes for block_number and chain --
ALTER TABLE TotalSupply ADD INDEX TotalSupply_block_number_index block_number TYPE minmax;
ALTER TABLE TotalSupply ADD INDEX TotalSupply_chain_index chain TYPE minmax;

-- MV for contract --
CREATE MATERIALIZED VIEW mv_TotalSupply_contract
ENGINE = MergeTree()
ORDER BY (address)
POPULATE
AS SELECT * FROM TotalSupply;