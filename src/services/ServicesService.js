const { PrismaClient } = require("@prisma/client");
const { equal } = require("joi");
const { NoContent } = require("../common/variable");
const prisma = new PrismaClient();
const path = require("path");
const { HOST_USER_SERVICE } = require("../common/HOST_SERVICE");

exports.getListServices = async function (filter, host) {
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
    const listServices = await prisma.services.findMany({
      ...paginateObj,
      where: {
        name: { contains: name },
        isDeleted: false,
      },
      include: {
        serviceType: true,
      },
    });
    if (listServices.length > 0) {
      listServices.forEach((item) => {
        if (item.imageName) {
          item.imagePath =
            HOST_USER_SERVICE + "src/images/services/" + item.imageName;
        }
      });
    }
    return listServices;
  } catch (err) {
    throw err;
  }
};

exports.getServiceById = async function (id, host) {
  try {
    const service = await prisma.services.findFirst({
      where: { Id: id },
      include: { serviceType: true },
    });

    if (service) {
      if (service.imageName) {
        service.imagePath =
          HOST_USER_SERVICE + "src/images/services/" + service.imageName;
      }
    }
    return service;
  } catch (err) {
    throw err;
  }
};

exports.createService = async function (data) {
  try {
    const createService = await prisma.services.create({
      data,
    });
    return createService;
  } catch (err) {
    throw err;
  }
};

exports.updateService = async function (id, data, host) {
  try {
    let oldService = await prisma.services.findFirst({ where: { Id: id } });
    let service = await prisma.services.update({
      where: { Id: id },
      data,
    });

    if (service) {
      if (data.imageName) {
        service.imagePath =
          HOST_USER_SERVICE + "src/images/services/" + data.imageName;
        deleteImgByPath(
          path.join(
            __dirname,
            "../../src/images/services/" + oldService.imageName
          )
        );
      }
    }
    return service;
  } catch (err) {
    throw err;
  }
};

async function deleteImgByPath(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {}
}
exports.deleteManyServices = async function (idArray) {
  try {
    let deleteManyServices = await prisma.services.updateMany({
      where: { Id: { in: idArray } },
      data: {
        isDeleted: true,
      },
    });
    if (deleteManyServices.count === 0) return NoContent;
    return deleteManyServices;
  } catch (err) {
    throw err;
  }
};
