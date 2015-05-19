#!/usr/bin/env python
#coding: utf-8

import ystockquote
from datetime import *
from models import Stock, Price
from db import DbHelper


def to_float(s):
    try:
        return float(s)
    except ValueError:
        return 0


def get_stock(stock_name):
    info = ystockquote.get_all(stock_name)

    force_insert = False
    try:
        m = Stock.get(Stock.name == stock_name)
    except Stock.DoesNotExist:
        m = Stock()
        m.create_time = datetime.now()
        m.name = stock_name
        m.is_del = 0
        force_insert = True
    m.price = to_float(info['price'])
    m.market_cap = info['market_cap']
    m.fifty_two_week_high = info['fifty_two_week_high']
    m.fifty_two_week_low = info['fifty_two_week_low']
    m.change = to_float(info['change']) / (m.price - to_float(info['change']))
    m.high_change = 1 - to_float(m.price) / to_float(m.fifty_two_week_high)
    m.rank = 0
    m.price_earnings_ratio = to_float(info['price_earnings_ratio'])
    m.update_time = datetime.now()
    DbHelper.save(m, force_insert)

    stock_id = m.id

    today = date.today()
    prices_cnt = Price.select().where(Price.stock_id == stock_id).count()
    if prices_cnt > 0:
        delta = timedelta(days=5)
    else:
        delta = timedelta(days=365)
    start_day = today - delta
    end_day = today

    last_price = -1
    prices = ystockquote.get_historical_prices(stock_name, str(start_day),
                                               str(end_day))
    for tdate in sorted(prices):
        close_price = to_float(prices[tdate]['Close'])
        if last_price < 0:
            last_price = close_price
            continue

        force_insert = False
        try:
            m = Price.get(Price.stock_id == stock_id, Price.create_date ==
                          tdate)
        except Price.DoesNotExist:
            m = Price()
            m.stock_id = stock_id
            m.create_date = tdate
            m.create_time = datetime.now()
            force_insert = True
        m.update_time = datetime.now()
        m.close_price = close_price
        m.volumn = prices[tdate]['Volume']
        if close_price > last_price:
            m.change_up = (close_price - last_price) / last_price
            m.change_down = 0
        else:
            m.change_down = (close_price - last_price) / last_price
            m.change_up = 0
        last_price = close_price
        DbHelper.save(m)
