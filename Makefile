
all: 
	docker-compose up --build

stop:
	docker-compose stop

resume:
	docker-compose start

clean:
	docker-compose down
	docker container prune -f
	docker volume prune -f

fclean: clean
	docker system prune -af

r: clean all

re: fclean all
	
