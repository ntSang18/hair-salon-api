const { PrismaClient } = require('@prisma/client');
const { equal } = require('joi');
const { NoContent } = require('../common/variable')
const prisma = new PrismaClient()

exports.getListServiceTypes = async function (filter) {
    const page = filter.page ? parseInt(filter.page) : filter.page;
    const pageSize = filter.pageSize
        ? parseInt(filter.pageSize)
        : filter.pageSize;
    const paginateObj =
        page != undefined && pageSize != undefined
            ? {
                skip: pageSize * page - pageSize,
                take: pageSize,
            }
            : {};
    const name = filter.name ? filter.name : "";
    try {
        const listServiceTypes = await prisma.serviceTypes.findMany({
            ...paginateObj,
            where: {
                name: { contains: name },
                isDeleted: false,
            },
            include: {
                services: true
            }
        });
        return listServiceTypes;
    } catch (err) {
        throw err;
    }
}

exports.getServiceTypeById = async function (id) {
    try {
        const serviceType = await prisma.serviceTypes.findFirst({
            where: { Id: id },
            include: { services: true }
        });
        return serviceType;
    } catch (err) {
        throw err;
    }
};

exports.createServiceType = async function (data) {
    try {
        const createServiceType = await prisma.serviceTypes.create({
            data,
        });
        return createServiceType;
    } catch (err) {
        throw err;
    }
};

exports.updateServiceType = async function (id, data) {
    try {
        let serviceType = await prisma.serviceTypes.update({
            where: { Id: id },
            data,
        });
        return serviceType;
    } catch (err) {
        throw err;
    }
};

exports.deleteManyServiceTypes = async function (idArray) {
    try {
      let deleteManyServiceTypes = await prisma.serviceTypes.updateMany({
        where: { Id: { in: idArray } },
        data: {
          isDeleted: true,
        },
      });
      if (deleteManyServiceTypes.count === 0) return NoContent;
      return deleteManyServiceTypes;
    } catch (err) {
      throw err;
    }
  };
  