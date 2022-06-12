APP_NAME=speedometer
OBJS := main.o

${APP_NAME}: ${OBJS}
	${CC} -o ${APP_NAME} ${CFLAGS} ${LDFLAGS} -L${SDK_PATH}/staging_dir/target-aarch64_cortex-a72_musl/usr/lib -lgpiod ${OBJS}

${OBJS} : %.o : %.c
	${CC} -c ${CFLAGS} $< -o $@

.PHONY: clean
clean:
	-rm -f ${OBJS} ${APP_NAME}
