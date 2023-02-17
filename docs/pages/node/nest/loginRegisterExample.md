### 实现一个简单的登录注册，获取验证码功能

1. 连接数据库
``` js
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

const MONGO_MODEL = TypeOrmModule.forFeature([User])

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'lng123456',
      database: 'chat-room',
      entities: [],
      synchronize: true,
      autoLoadEntities: true
    }),
    MONGO_MODEL
  ],
  exports: [MONGO_MODEL]
})
export class DbModule {}
```

2. 创建实例
``` js
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @ApiProperty({
    name: 'username',
    default: '张三'
  })
  username: string;

  @Column()
  @ApiProperty({
    name: 'password',
    default: '123456'
  })
  password: string;
}
```

3. 注册
```js
// 注册实例
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/db/entity/user.entity";

export class RegisterUserDto extends User {
  @ApiProperty()
  captchaId: string;

  @ApiProperty()
  captchaText: string;
}
// 注册用户&信息校验
public registerUser(registerUserDto: RegisterUserDto): Promise<string> {
  return (
    Promise.resolve(registerUserDto)
      // 4.检查密码是否过于简单
      .then((res) => {
        const pwdStrength = passwordStrength(res.password);
        if (
          pwdStrength.value === 'Strong' ||
          pwdStrength.value === 'Medium'
        ) {
          return res;
        }
        throw '密码过于简单，请使用大写字母，小写字母，特殊符号及数字';
      })
      // 5.注册用户
      .then(async (res) => {
        console.log(res);
        try {
          let { username, password } = res;
          password = this.hashPassword(password);
          // console.log(password)
          const user = await this.userRepository.create({
            username,
            password,
          });
          await this.userRepository.save(user);
          return '用户创建成功';
        } catch (err) {
          // logger.error(`Failed to register user: ${JSON.stringify(res)}`, err.stack)
          throw new Error('注册失败');
        }
      })
      .catch((err) => {
        return err;
      })
  );
}
```

4. 检验用户名是否已经注册
``` js
public checkUsername(username: string): Promise<boolean> {
  return (
    Promise.resolve(username)
      // 3.检查用户名是否正确
      .then(async (username) => {
        const found = await this.userRepository.findOne({
          where: {
            username,
          },
        });
        // console.log(`用户注册登录${found}`)
        if (found) throw '用户已注册';
        return false;
      })
      .catch((err) => {
        return true;
      })
  );
}
```

5. 获取验证码
``` js
// 验证码实例
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/db/entity/user.entity";

export class BackCaptcha {
  @ApiProperty()
  id: string;

  @ApiProperty()
  data: string;
}

export class Captcha extends BackCaptcha {
  @ApiProperty()
  text: string;

  @ApiProperty()
  time: Date;
}

export class CheckCaptchaDto {
  @ApiProperty()
  captchaId: string;

  @ApiProperty()
  captchaText: string;
}
// 返回验证码方法
public backCaptcha(): BackCaptcha {
  let getdiffCaptcha = false;
  let c: svgCaptcha.CaptchaObj;
  let captcha: Captcha;
  // 知道生成captchas中没有的验证码
  while (!getdiffCaptcha) {
    c = svgCaptcha.create();
    console.log(c.text);
    if (!this.captchas.has(c.text)) {
      // let nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
      const id: string = nanoid(10);
      captcha = Object.assign(c, { time: new Date(), id });
      console.log(captcha);
      getdiffCaptcha = true;
      this.captchas.set(id, captcha);
    }
  }
  const returnCaptcha: Captcha = JSON.parse(JSON.stringify(captcha));
  delete returnCaptcha.text;
  return returnCaptcha;
}
```

6. 检验验证码是否可以过期
``` js
public checkCaptcha(checkCaptchaDto: CheckCaptchaDto): Promise<boolean> {
  // 1.检查验证码是否过期
  return (
    Promise.resolve(checkCaptchaDto)
      .then((res) => {
        // const backCaptcha = res.captcha;
        const captcha = this.captchas.get(res.captchaId);
        // new Date().getTime() - captcha.time.getTime() > 30 * 60 * 1000
        if (new Date().getTime() - captcha.time.getTime() > 30 * 60 * 1000) {
          throw new Error('验证码已过期');
        }
        return { registerUserDto: res, captcha };
      })
      // 2.检查验证码是否正确
      .then((res) => {
        if (
          res.registerUserDto.captchaText.toLowerCase() !==
          res.captcha.text.toLowerCase()
        ) {
          throw '验证码错误';
        }
        return true;
      })
      .catch((err) => {
        return false;
      })
  );
}
```

7. 密码加密
```js
private hashPassword(password: string): string {
  return bcrypt.hashSync(password, 8);
}
```