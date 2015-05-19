# -*- coding: utf-8 -*-

import sys
import traceback

class DbHelper(object):
    @staticmethod
    def save(m, is_force_insert = False, is_only = None):
        try:
            m.save(force_insert = is_force_insert, only = is_only)
            return True
        except Exception, e:
            traceback.print_exc()
        return False
