#!/usr/bin/env python
#coding: utf-8

import MySQLdb
import MySQLdb.cursors

class DB:
    conn = None

    def __init__(self):
        self.connect()

    def connect(self):
        print "connect db"
        self.conn = MySQLdb.connect(host="localhost", user="root", passwd="1q2w3e", \
			db="stock", cursorclass=MySQLdb.cursors.DictCursor)
        self.conn.autocommit(True)

    def query(self, sql):
        try:
            cursor = self.conn.cursor()
            cursor.execute(sql)
        except (AttributeError, MySQLdb.OperationalError):
            print "reconnect db"
            self.connect()
            cursor = self.conn.cursor()
            cursor.execute(sql)
        return cursor
