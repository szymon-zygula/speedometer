#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#include <gpiod.h>

static const char* CHIPNAME = "gpiochip0";
static const char* CONSUMER = "example1";
static const unsigned int LINE_TRIGGER = 18;
static const unsigned int LINE_ECHO = 24;
static const unsigned int TRIGGER_IMPULSE_DURATION_US = 10;
static const double SOUND_SPEED_M_PER_S = 340.29;

typedef double distance_t;

struct hardware_io_t {
    struct gpiod_chip* chip;

    struct gpiod_line* trigger;
    struct gpiod_line* echo;
};

void exit_perror(const char* msg) {
    perror(msg);
    exit(EXIT_FAILURE);
}

void exit_error(const char* msg) {
    fprintf(stderr, "%s", msg);
    exit(EXIT_FAILURE);
}

#define CHECK_ERR(_res, _msg) \
    if ((_res) == -1) {       \
        exit_perror(_msg);    \
    }

#define CHECK_NULL(_res, _msg) \
    if ((_res) == NULL) {      \
        exit_perror(_msg);     \
    }

void sleep_for_us(unsigned int us) {
    unsigned int left = us;
    while (left != 0) {
        left = usleep(left);
    }
}

long get_time_ns() {
    struct timespec now;
    clock_gettime(CLOCK_MONOTONIC, &now);
    return (long)now.tv_sec * 1e9 + now.tv_nsec;
}

void open_harware_io(struct hardware_io_t* hio) {
    hio->chip = gpiod_chip_open_by_name(CHIPNAME);
    CHECK_NULL(hio->chip, "Error opening chip");

    hio->trigger = gpiod_chip_get_line(hio->chip, LINE_TRIGGER);
    CHECK_NULL(hio->trigger, "Could not open TRIGGER line");
    hio->echo = gpiod_chip_get_line(hio->chip, LINE_ECHO);
    CHECK_NULL(hio->echo, "Could not open ECHO line");

    CHECK_ERR(gpiod_line_request_output(hio->trigger, CONSUMER, 0),
              "Could not request TRIGGER line for output");
    CHECK_ERR(gpiod_line_request_input(hio->echo, CONSUMER),
              "Could not request ECHO line for input");
}

void close_hardware_io(struct hardware_io_t* hio) {
    // No errors possible
    gpiod_line_release(hio->trigger);
    gpiod_line_release(hio->echo);

    gpiod_chip_close(hio->chip);
}

void trigger_on(struct hardware_io_t* hio) {
    CHECK_ERR(gpiod_line_set_value(hio->trigger, 1), "Error while switching on TRIGGER");
}

void trigger_off(struct hardware_io_t* hio) {
    CHECK_ERR(gpiod_line_set_value(hio->trigger, 0), "Error while switching off TRIGGER");
}

void start_measurement(struct hardware_io_t* hio) {
    trigger_on(hio);
    sleep_for_us(TRIGGER_IMPULSE_DURATION_US);
    trigger_off(hio);
}

bool is_echo_set(struct hardware_io_t* hio) {
    int res = gpiod_line_get_value(hio->echo);

    if (res == -1) {
        exit_perror("Error getting ECHO line value");
    }

    return res;
}

// Returns time in ns at which echo became `val`
double wait_for_echo_val(struct hardware_io_t* hio, int val) {
    double high_time;
    for (;;) {
        high_time = get_time_ns();

        if (is_echo_set(hio) == val) {
            return high_time;
        }
    }
}

double measurement_to_distance_m(double high_duration_ns) {
    return high_duration_ns / 1e9 / 2.0 * SOUND_SPEED_M_PER_S;
}

distance_t get_distance_m(struct hardware_io_t* hio) {
    start_measurement(hio);
    double start = wait_for_echo_val(hio, 1);
    double end = wait_for_echo_val(hio, 0);
    return measurement_to_distance_m(end - start);
}

int main() {
    struct hardware_io_t hio;
    open_harware_io(&hio);

    distance_t distance = get_distance_m(&hio);
    long current_time = get_time_ns();
    printf("%lf;%ld", distance, current_time);

    close_hardware_io(&hio);
}
