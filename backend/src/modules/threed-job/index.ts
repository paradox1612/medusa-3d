import ThreeDJobModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const THREED_JOB_MODULE = "threedJob"

export default Module(THREED_JOB_MODULE, {
  service: ThreeDJobModuleService,
})
