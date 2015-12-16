package com.wixpress.test
import com.wixpress.hoopoe.config.TestConfigFactory._
import com.twitter.util.CountDownLatch
import com.wix.bootstrap.RunServer
import com.wix.bootstrap.RunServer.Options

object EmbeddedEnvironment {
  val WEB_SERVER_PORT = 9901
  private val started = new CountDownLatch(1)

  aTestEnvironmentFor[Config]("test-server", "scripts_domain" -> "wohoo")

  RunServer(WebServer, Options(port = Some(WEB_SERVER_PORT)))

  started.countDown()

  def awaitForStartup() = started.await()
}
