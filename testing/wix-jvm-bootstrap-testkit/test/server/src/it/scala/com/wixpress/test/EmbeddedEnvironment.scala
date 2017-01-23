package com.wixpress.test

import com.wix.bootstrap.BootstrapManagedService
import com.wixpress.framework.test.env.{Configurer, TestEnvBuilder}
import com.wixpress.framework.test.jetty.WixPortConfiguration
import com.wixpress.hoopoe.config.TestConfigFactory._
import com.wixpress.petri.petri.{FakePetriServer, RAMPetriClient}

object EmbeddedEnvironment {

  val generateConfig = Configurer {
    aTestEnvironmentFor[Config]("test-server", "scripts_domain" -> "wohoo")
  }

  val petri = FakePetriServer.aServer(WixPortConfiguration.DefaultManagementPort + 10, new RAMPetriClient)

  val env = TestEnvBuilder()
    .withConfigurer(generateConfig)
    .withCollaborators(petri)
    .withMainService(BootstrapManagedService(WebServer))
    .build()
}
