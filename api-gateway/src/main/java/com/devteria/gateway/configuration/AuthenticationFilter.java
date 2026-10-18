package com.devteria.gateway.configuration;

import com.devteria.gateway.dto.response.ApiResponse;
import com.devteria.gateway.service.IdentityService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


import java.util.Arrays;
import java.util.List;


@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationFilter implements GlobalFilter, Ordered {
    IdentityService identityService;
    ObjectMapper objectMapper;

    @NonFinal
    static String[] PUBLIC_ENDPOINTS = {
        "/identity/auth/.*",
        "/identity/users/register"
    };

    @Value("${app.api-prefix}")
    @NonFinal
    private String apiPrefix;

    @Override
//    Mỗi khi thực hiện 1 request thôgn qua gateway thì sẽ phải thông qua hàm filer này
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Enter authentication filter:");

        if(isPublicEndpoint(exchange.getRequest()))
        {
            return chain.filter(exchange);
        }
//        Get token from authorization header
        List<String> authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (CollectionUtils.isEmpty(authHeader)) {
            return unauthenticated(exchange.getResponse());

        }
        String token = authHeader.getFirst().replace("Bearer","").trim();
        log.info(token);


        //        Verify token
        //        Delegate identityService
            // FlatMap để lấy kết quả của method dược gọi
        return identityService.introspect(token).flatMap(
                introspectResponse -> {
                    if(introspectResponse.getResult().isValid())
                        return chain.filter(exchange);
                    else{
                        return unauthenticated(exchange.getResponse());
                    }
                }
        )
                .onErrorResume(throwable -> unauthenticated(exchange.getResponse()))
        ;




//        Verfify not success
//        Return error 401

//      Verify success

    }
    private boolean isPublicEndpoint(ServerHttpRequest request)
    {

        log.info("URI:"+ request.getURI().toString());

        String endpoint = request.getURI().getPath().toString();
        log.info(endpoint);
        return Arrays.stream(PUBLIC_ENDPOINTS).anyMatch(
                e -> endpoint.matches(apiPrefix+e)
        );
    }

    @Override
    public int getOrder() {
        return 0;
    }

    Mono<Void> unauthenticated(ServerHttpResponse response)
    {
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(1401)
                .message("Unauthenticated")
                .build();

        String body = null;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return  response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}

