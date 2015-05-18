#!/usr/bin/env python
#coding: utf-8

from flask import Flask, render_template, request
import MySQLdb
import MySQLdb.cursors
from tasks.lib.stock_util import get_stock

app = Flask(__name__)

database = MySQLdb.connect(host="localhost", user="root", passwd="1q2w3e", \
			db="stock", cursorclass=MySQLdb.cursors.DictCursor)
database.autocommit(True)


@app.route("/add")
def add():
    cursor = database.cursor()
    symbol = request.args.get('symbol', None)
    if symbol is None:
        return 'error'
    cursor.execute("SELECT id FROM stock WHERE name = '%s'" % (symbol))
    m = cursor.fetchall()
    if len(m) > 0:
        cursor.execute("UPDATE stock SET is_del = 0 WHERE name = '%s'" %
                       (symbol))
        get_stock(symbol)
        return 'exist'
    ret = cursor.execute("INSERT INTO stock(name) VALUES ('%s')" % (symbol))
    get_stock(symbol)
    return 'success'


@app.route("/delete")
def delete():
    cursor = database.cursor()
    symbol = request.args.get('symbol', None)
    cursor.execute("UPDATE stock SET is_del = 1 WHERE name = '%s'" % (symbol))
    return 'success'


@app.route("/")
def index():
    cursor = database.cursor()
    cursor.execute("SELECT id,name from stock WHERE is_del = 0 ORDER BY id ASC")
    stocks = cursor.fetchall()
    symbol = request.args.get('symbol', None)
    if symbol is None:
        symbol = stocks[0]['name']
    cursor.execute("SELECT * from stock WHERE name = '%s'" % (symbol))
    stock = cursor.fetchone()
    cursor.execute(
        "SELECT * from price WHERE stock_id = '%d' ORDER BY create_date DESC LIMIT 300"
        % (stock['id']))
    prices = cursor.fetchall()
    return render_template(
        'stock.html',
        data=
        {'stock': stock,
         'prices': prices,
         'stocks': stocks,
         'symbol': symbol})


if __name__ == "__main__":
    app.run()
