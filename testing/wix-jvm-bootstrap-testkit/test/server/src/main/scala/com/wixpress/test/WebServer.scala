package com.wixpress.test

import com.fasterxml.jackson.databind.ObjectMapper
import com.wix.bootstrap.jetty.BootstrapServer
import com.wix.bootstrap.spring.CustomJacksonConfig
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMethod._
import org.springframework.web.bind.annotation.{RequestMapping, ResponseBody}

object WebServer extends BootstrapServer with CustomJacksonConfig {
  
  override def additionalSpringConfig = Some(classOf[SpringConfig])
  override def configureObjectMapper(objectMapper: ObjectMapper): Unit = {}
}

@Configuration
class SpringConfig {
  @Bean def api = new Api
}

@Controller
class Api {
  @RequestMapping(value = Array("/"), method = Array(GET))
  @ResponseBody
  def getRules: String = "hello"
}