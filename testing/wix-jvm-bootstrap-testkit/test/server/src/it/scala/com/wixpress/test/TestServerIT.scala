package com.wixpress.test

import com.wix.e2e.http.sync._
import com.wix.e2e.{ResponseMatchers, ServerPort}
import com.wixpress.test.EmbeddedEnvironment.WEB_SERVER_PORT
import org.specs2.mutable.{Before, SpecWithJUnit}

import scala.concurrent.duration._

class TestServerIT extends SpecWithJUnit with Before with ResponseMatchers {
  implicit val defaultServerPort: ServerPort = WEB_SERVER_PORT
  val readTimeout = 5.seconds

  "Api" should {
    "respond with 'hello' on '/'" in {
      get("/") must beSuccessfulWith("hello")
    }
  }

  override def before: Any = EmbeddedEnvironment.awaitForStartup()
}
