#!/bin/sh

TOOLCHAIN_PATH=$OPENWRT_SDK_PATH/staging_dir/toolchain-aarch64_cortex-a72_gcc-8.4.0_musl/bin
APP_NAME=speedometer
echo Using toolchain at $TOOLCHAIN_PATH
export PATH=$TOOLCHAIN_PATH:$PATH
make clean
make ARCH=arm CC=aarch64-openwrt-linux-gcc CFLAGS=-g speedometer
