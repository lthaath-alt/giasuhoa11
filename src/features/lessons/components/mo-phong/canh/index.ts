/**
 * DANH SÁCH KỊCH BẢN THÍ NGHIỆM 3D — xếp theo thứ tự bài trong chương trình.
 *
 * Mỗi kịch bản ứng với một thí nghiệm trong `thiNghiemTheoBai.ts` (khớp bằng
 * trường `moPhong`). Thêm thí nghiệm mới: viết kịch bản trong tệp của bài, khai
 * ở đây và thêm id vào kiểu `MoPhong` — khung chạy và giao diện không phải sửa.
 *
 * Ba mô phỏng của Bài 2 (đèn dẫn điện, chuẩn độ, điện li nhiều nấc) là component
 * React riêng, không đi qua danh sách này.
 */
import { KichBan } from '../kichBan';
import { MoPhong } from '../../../thiNghiemTheoBai';
import { b1Ch3coonaNhietDo, b1Ch3coonaNongDo, b1No2NhietDo } from './b1';
import { b2ChatChiThi, b2ThuyPhanMuoi } from './b2';
import { b5Nh3Hcl, b5NhanBietNh4 } from './b5';
import { b6CuHno3 } from './b6';
import { b7SFe, b7SO2, b7So2Bromine } from './b7';
import { b8CuH2so4, b8HaoNuoc, b8NhanBietSo4 } from './b8';
import { b11Chiet, b11ChungCat, b11KetTinh, b11SacKiGiay } from './b11';
import { b15HexaneBromine, b15OxiHoaHexane } from './b15';
import { b16Acetylene, b16ChuoiChin, b16Ethylene } from './b16';
import { b17CongChlorine, b17NitroHoaBenzene, b17TolueneKmno4 } from './b17';
import { b19ThuyPhan } from './b19';
import { b20Chay, b20EthanolNa, b20GlycerolCuoh2 } from './b20';
import { b21PhenolBromine, b21PhenolNaoh } from './b21';
import { b23Cuoh2, b23Iodoform, b23TrangBac } from './b23';
import { b24EsterHoa, b24GiamBakingSoda, b24TinhAcid } from './b24';

export const KICH_BAN: KichBan[] = [
  b1No2NhietDo, b1Ch3coonaNhietDo, b1Ch3coonaNongDo,
  b2ChatChiThi, b2ThuyPhanMuoi,
  b5NhanBietNh4, b5Nh3Hcl,
  b6CuHno3,
  b7SFe, b7SO2, b7So2Bromine,
  b8CuH2so4, b8HaoNuoc, b8NhanBietSo4,
  b11ChungCat, b11Chiet, b11KetTinh, b11SacKiGiay,
  b15HexaneBromine, b15OxiHoaHexane,
  b16Ethylene, b16Acetylene, b16ChuoiChin,
  b17NitroHoaBenzene, b17CongChlorine, b17TolueneKmno4,
  b19ThuyPhan,
  b20Chay, b20GlycerolCuoh2, b20EthanolNa,
  b21PhenolNaoh, b21PhenolBromine,
  b23TrangBac, b23Cuoh2, b23Iodoform,
  b24TinhAcid, b24EsterHoa, b24GiamBakingSoda,
];

export const timKichBan = (id: MoPhong): KichBan | undefined => KICH_BAN.find(k => k.id === id);
