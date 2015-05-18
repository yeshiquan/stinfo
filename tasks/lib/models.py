import peewee as pw

stock_db = pw.MySQLDatabase("stock",
                            host="127.0.0.1",
                            port=3306,
                            user="root",
                            passwd="1q2w3e")


class MySQLModel(pw.Model):
    """A base model that will use our MySQL database"""

    class Meta:
        database = stock_db


class Stock(MySQLModel):
    id = pw.IntegerField()
    rank = pw.IntegerField()
    name = pw.CharField()
    market_cap = pw.CharField()
    price = pw.DecimalField()
    change = pw.DecimalField()
    fifty_two_week_high = pw.DecimalField()
    fifty_two_week_low = pw.DecimalField()
    high_change = pw.DecimalField()
    is_del = pw.IntegerField()
    price_earnings_ratio = pw.FloatField()
    create_time = pw.DateTimeField()
    update_time = pw.DateTimeField()


class Price(MySQLModel):
    id = pw.IntegerField()
    close_price = pw.DecimalField()
    volumn = pw.IntegerField()
    stock_id = pw.IntegerField()
    change_up = pw.DecimalField()
    change_down = pw.DecimalField()
    create_date = pw.DateField()
    create_time = pw.DateTimeField()
    update_time = pw.DateTimeField()

# when you're ready to start querying, remember to connect
stock_db.connect()
