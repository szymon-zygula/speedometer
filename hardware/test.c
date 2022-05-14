#include <stdio.h>
#include <stdlib.h>
#include <time.h>

long get_time_ns() {
    struct timespec now;
    clock_gettime(CLOCK_MONOTONIC, &now);
    return (long)now.tv_sec * 1e9 + now.tv_nsec;
}

int main(int argc, char** argv) {
    srand(get_time_ns());
    printf("%lf;%ld", ((double)(rand() % 2000) - 1000.0) / 100.0, get_time_ns());
    return argc != 1;
}
