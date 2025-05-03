//test.js

const server = require('./app.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe('User Endpoints', () => {

  it('GET /user should show all users', async () => {
    const res = await requestWithSupertest.get('/api/users');

      expect(res.status).toEqual(200);
      expect(res.type).toEqual(expect.stringContaining('json'));
      expect(res.body).toHaveProperty('users')
      expect(res.body.users.length > 0)
      expect(res.body.users[0]).toHaveProperty('id')
      expect(res.body.users[0]).toHaveProperty('login')
      expect(res.body.users[0]).toHaveProperty('fio')
      expect(res.body.users[0]).toHaveProperty('role_label')
  });

  it('Нельзя получить доступ к странице со списком без авторизации', async () => {
    const res = await requestWithSupertest.get('/users');
    expect(res.status).toEqual(403);
  });

  it('Доступ к /users после логина как admin', async () => {
    // Логинимся и сохраняем куку
    const loginRes = await requestWithSupertest
        .post('/api/auth/login')
        .send({login: 'admin', password: 'test'});

    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const usersRes = await requestWithSupertest.get('/users').set('Cookie', cookies);

    expect(usersRes.status).toBe(200);
  });

  it('Доступ к /users запрещен после логина как employee', async () => {
    // Логинимся и сохраняем куку
    const loginRes = await requestWithSupertest
        .post('/api/auth/login')
        .send({login: 'employee', password: 'test'});

    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const usersRes = await requestWithSupertest.get('/users').set('Cookie', cookies);

    expect(usersRes.status).toBe(403);
  });
});


describe('Main', () => {
  it('GET / для неавторизаванного пользователя должен иметь кнопку вход', async () => {
    const res = await requestWithSupertest.get('/');
    expect(res.status).toEqual(200);
    expect(res.text.includes('Войти')).toEqual(true);
  });

  it('GET / для неавторизаванного пользователя не должен иметь ссылок на другие разделы', async () => {
    const res = await requestWithSupertest.get('/');
    expect(res.status).toEqual(200);
    expect(res.text.includes('Клиенты')).toEqual(false);
  });
});

describe('Auth Endpoint', () => {
  it('Авторизация с корректной парой логин/пароль', async () => {
    const res = await requestWithSupertest.post(
        '/api/auth/login'
    ).send(
        {
          login: 'admin',
          password: 'test'
        });
    expect(res.status).toEqual(200);
    expect(res.body.msg).toEqual('');
  });

  it('Невозможность авторизации с некорректным паролем', async () => {
    const res = await requestWithSupertest.post(
        '/api/auth/login'
    ).send(
        {
          login: 'admin',
          password: 'wrong_password'
        });
    expect(res.status).toEqual(200);
    expect(res.body.msg).toEqual('Неверный логин/пароль');
  });

  it('Невозможность авторизации для несуществующего логина', async () => {
    const res = await requestWithSupertest.post(
        '/api/auth/login'
    ).send(
        {
          login: 'wrong_user',
          password: 'wrong_password'
        });
    expect(res.status).toEqual(200);
    expect(res.body.msg).toEqual('Неверный логин/пароль');
  });

});