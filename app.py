#!/usr/bin/env python
#coding: utf-8

from flask import Flask, render_template, request
from tasks.lib.stock_util import get_stock
from lib.database import DB

app = Flask(__name__)
db = DB()

@app.route("/add")
def add():
    symbol = request.args.get('symbol', None)
    if symbol is None:
        return 'error'
    cursor = db.query("SELECT id FROM stock WHERE name = '%s'" % (symbol))
    m = cursor.fetchall()
    if len(m) > 0:
        db.query("UPDATE stock SET is_del = 0 WHERE name = '%s'" %
                       (symbol))
        get_stock(symbol)
        return 'exist'
    db.query("INSERT INTO stock(name) VALUES ('%s')" % (symbol))
    get_stock(symbol)
    return 'success'

@app.route("/hello")
def hello():
    return 'Hello,World'

@app.route("/delete")
def delete():
    symbol = request.args.get('symbol', None)
    db.query("UPDATE stock SET is_del = 1 WHERE name = '%s'" % (symbol))
    return 'success'


@app.route("/")
def index():
    cursor = db.query("SELECT id,name from stock WHERE is_del = 0 ORDER BY id ASC")
    stocks = cursor.fetchall()
    symbol = request.args.get('symbol', None)
    if symbol is None:
        symbol = stocks[0]['name']
    cursor = db.query("SELECT * from stock WHERE name = '%s'" % (symbol))
    stock = cursor.fetchone()
    cursor = db.query(
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
