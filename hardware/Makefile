APP_NAME=linswapp-hardware
OBJS := main.o

${APP_NAME}: ${OBJS}
	${CC} -o ${APP_NAME} ${CFLAGS} ${LDFLAGS} -lgpiod ${OBJS}

${OBJS} : %.o : %.c
	${CC} -c ${CFLAGS} $< -o $@

.PHONY: clean
clean:
	-rm -f ${OBJS} ${APP_NAME}
