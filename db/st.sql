CREATE TABLE `stock` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '×Ôid',
  `rank` int NOT NULL DEFAULT 0 COMMENT 'rank',
  `name` varchar(16) NOT NULL COMMENT 'stock name',
  `price`  DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'stock price',
  `change`  DECIMAL(6,4) NOT NULL DEFAULT 0 COMMENT 'change',
  `fifty_two_week_high`  DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'fifty_two_week_high',
  `fifty_two_week_low`  DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'fifty_two_week_low',
  `high_change`  DECIMAL(6,4) NOT NULL DEFAULT 0 COMMENT 'high change',
  `is_del` tinyint(4) NOT NULL DEFAULT 0 COMMENT 'is delete',
  `market_cap` varchar(24) NOT NULL DEFAULT '' COMMENT 'market cap',
  `price_earnings_ratio`  float NOT NULL DEFAULT 0 COMMENT 'price_earnings_ratio',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '´´½¨ʱ¼ä
  `update_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '¸üä
  PRIMARY KEY (`id`),
  KEY idx_stock_name(name),
  KEY idx_rank(rank)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='stock table';

CREATE TABLE `price` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '×Ôid',
  `close_price` DECIMAL(5,2) NOT NULL COMMENT 'close price',
  `volumn` int NOT NULL COMMENT 'volumn',
  `change_up` DECIMAL(6,4) NOT NULL COMMENT 'change up',
  `change_down` DECIMAL(6,4) NOT NULL COMMENT 'change down',
  `stock_id` bigint(20) NOT NULL COMMENT 'stock id',
  `create_date` date NOT NULL COMMENT 'date:2014-05-17',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '´´½¨ʱ¼ä
  `update_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '¸üä
  PRIMARY KEY (`id`),
  KEY idx_stock_id(stock_id,create_date)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='stock price';
