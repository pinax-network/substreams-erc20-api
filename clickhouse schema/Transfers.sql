CREATE TABLE IF NOT EXISTS Transfers  (
    address FixedString(40),
    `from` String,
    `to` String,
    value String,
    transaction String,
    chain           LowCardinality(String),
    block_number    UInt32(),
    timestamp       DateTime64(3, 'UTC'),
)
ENGINE = MergeTree()
ORDER BY (timestamp, block_number, chain);

-- Indexes for block_number and chain --
ALTER TABLE Transfers ADD INDEX transfers_block_number_index block_number TYPE minmax;
ALTER TABLE Transfers ADD INDEX transfers_chain_index chain TYPE minmax;

-- MV for contract --
CREATE MATERIALIZED VIEW mv_transfers_contract
ENGINE = MergeTree()
ORDER BY (address, `from`,`to`)
POPULATE
AS SELECT * FROM Transfers;

-- MV for from --
CREATE MATERIALIZED VIEW mv_transfers_from
ENGINE = MergeTree()
ORDER BY (`from`, address)
POPULATE
AS SELECT * FROM Transfers;

-- MV for from --
CREATE MATERIALIZED VIEW mv_transfers_to
ENGINE = MergeTree()
ORDER BY (`to`, address)
POPULATE
AS SELECT * FROM Transfers;
