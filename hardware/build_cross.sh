#!/bin/sh

TOOLCHAIN_PATH=$BRPATH/output/host/usr/bin
APP_NAME=speedomenter-hardware
echo Using toolchain at $TOOLCHAIN_PATH
export PATH=$TOOLCHAIN_PATH:$PATH
make clean
make ARCH=arm CC=aarch64-none-linux-gnu-gcc CFLAGS=-g speedomenter-hardware
