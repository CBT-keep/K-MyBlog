---
title: 基于JWT的token认证
pubDate: 2026-06-26
description: 验证身份信息的一种方式
category: 技术
image: ""
draft: false
slugId: momo/jwt
---

# 基于token的认证
## 1.1 简介
很多对外开放的API需要识别请求者的身份，并据此判断所请求的资源是否可以返回给请求者。token就是一种用于身份验证的机制，基于这种机制，应用不需要在服务端保留用户的认证信息或者会话信息，可实现无状态、分布式的Web应用授权，为应用的扩展提供了便利。

## 1.2 流程描述
![token认证](./jwt.png)
以下是API网关利用JWT鉴权插件实现认证的整个业务流程，下面我们用文字来详细描述各步骤：

客户端向API网关发送请求，请求中携带token。

API网关使用用户插件中配置的公钥对请求中的token进行验证，验证通过后，将请求透传给后端服务。

后端服务处理后返回应答。

API网关将后端服务应答返回给客户端。

在整个过程中，API网关利用token认证机制，实现了用户使用自己的用户体系对API进行授权的能力。下面我们就要介绍API网关实现token认证所使用的结构化令牌JSON Web Token（JWT）。

# JWT
## 1.1 简介
Json Web Token（JWT），是为了在网络应用环境间传递声明而执行的一种基于JSON的开放标准RFC7519。JWT一般可以用作独立的身份验证令牌，可以包含用户标识、用户角色和权限等信息，以便于从资源服务器获取资源，也可以增加一些额外的其他业务逻辑所必须的声明信息，特别适用于分布式站点的登录场景。

## 1.2 JWT的构成
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```
如上面的例子所示，JWT就是一个字符串，由三部分构成：

Header（头部）

Payload（数据）

Signature（签名）

### Header
JWT的头部承载两个信息：

声明类型，这里是JWT。

声明加密的算法。

完整的头部就像下面这样的JSON：

```json
{
  'typ': 'JWT',
  'alg': 'HS256'
}
```
然后将头部进行Base64编码（该编码是可以对称解码的），构成了第一部分。

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
```

### Payload
载荷就是存放有效信息的地方。定义细节如下：

```
iss：令牌颁发者。表示该令牌由谁创建，该声明是一个字符串
sub:  Subject Identifier，iss提供的终端用户的标识，在iss范围内唯一，最长为255个ASCII个字符，区分大小写
aud：Audience(s)，令牌的受众，分大小写的字符串数组
exp：Expiration time，令牌的过期时间戳。超过此时间的token会作废， 该声明是一个整数，是1970年1月1日以来的秒数
iat: 令牌的颁发时间，该声明是一个整数，是1970年1月1日以来的秒数
jti: 令牌的唯一标识，该声明的值在令牌颁发者创建的每一个令牌中都是唯一的，为了防止冲突，它通常是一个密码学随机值。这个值相当于向结构化令牌中加入了一个攻击者无法获得的随机熵组件，有利于防止令牌猜测攻击和重放攻击。
```
也可以新增用户系统需要使用的自定义字段，比如下面的例子添加了name 用户昵称：
```json
{
  "sub": "1234567890",
  "name": "John Doe"
}
```
然后将其进行Base64编码，得到JWT的第二部分：

```
JTdCJTBBJTIwJTIwJTIyc3ViJTIyJTNBJTIwJTIyMTIzNDU2Nzg5MCUyMiUyQyUwQSUyMCUyMCUyMm5hbWUlMjIlM0ElMjAlMjJKb2huJTIwRG9lJTIyJTBBJTdE
```

### Signature
这个部分需要Base64编码后的Header和Base64编码后的Payload使用 . 连接组成的字符串，然后通过Header中声明的加密方式进行加密（$secret 表示用户的私钥），然后就构成了JWT的第三部分。

```
// javascript
var encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);
var signature = HMACSHA256(encodedString, '$secret');
```

将这三部分用 . 连接成一个完整的字符串，就构成了最开始的JWT示例。

## 1.3 授权范围与时效
API网关会认为用户颁发的token有权利访问整个分组下的所有绑定JWT插件的API。如果需要更细粒度的权限管理，还需要后端服务自行解开token进行权限认证。API网关会验证token中的exp字段，一旦这个字段过期了，API网关会认为这个token无效而将请求直接打回。过期时间这个值必须设置，并且过期时间一定要小于7天。

## 1.4 JWT的几个特点
1. JWT 默认是不加密，不能将秘密数据写入 JWT。

2. JWT 不仅可以用于认证，也可以用于交换信息。有效使用 JWT，可以降低服务器查询数据库的次数。JWT 的最大缺点是，由于服务器不保存 session 状态，因此无法在使用过程中废止某个 token，或者更改 token 的权限。也就是说，一旦 JWT 签发了，在到期之前就会始终有效，除非服务器部署额外的逻辑。

3. JWT 本身包含了认证信息，一旦泄露，任何人都可以获得该令牌的所有权限。为了减少盗用，JWT 的有效期应该设置得比较短。对于一些比较重要的权限，使用时应该再次对用户进行认证。

4. 为了减少盗用，JWT 不应该使用 HTTP 协议明码传输，要使用HTTPS 协议传输。

# 用Java实现基于JWT的登陆验证
## 1. 引入依赖项
~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<!-- JWT 操作库 -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
~~~

## 2. 编写JWT工具类
负责JWT的生成，解析以及验证
~~~java
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * 从令牌中获取用户名
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * 从令牌中获取过期时间
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 从令牌中获取指定claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 检查令牌是否过期
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * 为用户生成JWT令牌
     */
    public String generateToken(String username, Map<String, Object> claims) {
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey())
                .compact();
    }

    /**
     * 验证令牌是否有效
     */
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
~~~

## 3. 实现登录接口与token生成
~~~java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto loginDto) {
        // 1. 使用Spring Security验证用户名和密码
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword())
        );

        // 2. 如果验证通过，生成JWT
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Map<String, Object> claims = new HashMap<>();
        // 可以在claims里放入角色等信息
        claims.put("roles", userDetails.getAuthorities());

        String token = jwtUtil.generateToken(userDetails.getUsername(), claims);

        // 3. 返回Token给客户端
        return ResponseEntity.ok(new JwtResponse(token));
    }
}
~~~

## 4. 创建JWT请求过滤器
~~~java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 1. 从Header中提取JWT
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        jwt = authHeader.substring(7);

        // 2. 从JWT中解析出用户名
        username = jwtUtil.extractUsername(jwt);

        // 3. 如果用户名不为空且当前上下文没有认证信息，则进行验证
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 4. 验证Token是否有效
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                // 5. 创建认证令牌并存入上下文
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // 6. 继续执行后续过滤器
        filterChain.doFilter(request, response);
    }
}
~~~

## 5. 配置Spring Security

~~~java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 禁用CSRF
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll() // 放行登录接口
                .anyRequest().authenticated() // 其他所有请求都需要认证
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 无状态
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // 添加JWT过滤器

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 示例：使用内存用户，实际项目中会从数据库加载
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.builder()
                .username("user")
                .password(passwordEncoder().encode("password"))
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(user);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
~~~