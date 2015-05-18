#!/usr/bin/env python
#coding: utf-8

from lib.models import Stock, Price
from lib.stock_util import get_stock
from multiprocessing import Process

if __name__ == '__main__':
    stock_list = Stock.select().where(Stock.is_del == 0)
    for s in stock_list:
        p = Process(target=get_stock, args=(s.name,))
        p.start()
        p.join()
