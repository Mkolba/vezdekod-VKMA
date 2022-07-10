# -*- coding: utf-8 -*-
from datetime import datetime
import string
import random
import json


class BetterDict(dict):
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__

    @staticmethod
    def loads(obj):
        return json.loads(obj, object_pairs_hook=lambda x: BetterDict(x))


def arguments(count):
    return ','.join([f'${i}' for i in range(1, count + 1)])


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.timestamp()
    raise TypeError("Type %s not serializable" % type(obj))