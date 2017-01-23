package com.wixpress.test

import com.wix.e2e.ResponseMatchers._
import com.wix.e2e.http.Implicits.defaultServerPort
import com.wix.e2e.http.sync._
import com.wixpress.framework.test.env.{SpecificationWithGlobalTestEnv, TestEnv}

class TestServerIT extends SpecificationWithGlobalTestEnv {

  "Api" should {

    "respond with 'hello' on '/'" in {
      get("/") must beSuccessfulWith("hello")
    }

    "return value from config for '/config'" in {
      get("/config") must beSuccessfulWith("wohoo")
    }
  }

  override def testEnv: TestEnv = EmbeddedEnvironment.env
}
