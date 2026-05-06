create table login(
	username varchar(60),
    password varchar(60),
    role varchar(60),
    constraint pk_login primary key(username,password,role)
);
insert into login values ('pavan','1234','patient'),('nehal','1234','doctor'),('monish','1@3','admin');