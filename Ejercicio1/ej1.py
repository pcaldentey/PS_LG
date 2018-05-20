#! /usr/bin/env python
# -*- coding: UTF-8 -*-

def classify_numbers(numbers):
    for i in numbers:
        print "{} es un número {} ".format(i, get_number_class(i))

def get_number_class(number):
    try:
        number_class = 'defectivo'
        total = sum( i for i in range(1,number) if number%i == 0 )

        if total == number:
            number_class = 'perfecto'
        elif total > number:
            number_class = 'abundante'
    except TypeError:
        number_class = 'no es un entero'

    return number_class


if __name__ == '__main__':
    numbers = [6, 9, 12]
    classify_numbers(numbers)

