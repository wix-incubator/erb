package com.wixpress.test

import com.wix.bootstrap.jetty.BootstrapServer
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMethod._
import org.springframework.web.bind.annotation.{RequestMapping, ResponseBody}
import com.wixpress.hoopoe.config.ConfigFactory._
object WebServer extends BootstrapServer {
  override def additionalSpringConfig = Some(classOf[SpringConfig])
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

  @RequestMapping(value = Array("config"), method = Array(GET))
  @ResponseBody
  def getConfigValue: String = aConfigFor[Config]("test-server").configKey
}

case class Config(configKey: String)