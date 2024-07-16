-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 17, 2024 at 12:13 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `publicwifi`
--

-- --------------------------------------------------------

--
-- Table structure for table `peopleconn`
--

CREATE TABLE `peopleconn` (
  `id` int(11) NOT NULL,
  `loginId` varchar(300) NOT NULL,
  `passkey` varchar(400) NOT NULL,
  `type` varchar(240) NOT NULL,
  `expiration` datetime NOT NULL,
  `mac_address` varchar(300) NOT NULL,
  `ip_address` varchar(300) NOT NULL,
  `expired` int(11) NOT NULL,
  `is_hotspot_on` int(11) NOT NULL,
  `connected` int(11) NOT NULL,
  `upcoming` varchar(240) NOT NULL,
  `pending` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `done` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `peopleconn`
--

INSERT INTO `peopleconn` (`id`, `loginId`, `passkey`, `type`, `expiration`, `mac_address`, `ip_address`, `expired`, `is_hotspot_on`, `connected`, `upcoming`, `pending`, `date_created`, `done`) VALUES
(1, '1234567890', '1234567890', '', '2024-07-16 17:08:18', '00:E9:3A:11:92:F9', '192.168.1.102', 1, 0, 1, '', 0, '2024-07-16 17:08:18', 1),
(55, '88488', 'sIN6J', 'Monthly', '2024-04-15 10:00:00', '', '', 1, 0, 0, '', 0, '2024-07-16 06:24:46', 0),
(56, '46301', 'QiF&d', 'Monthly', '2024-07-16 08:00:33', '', '', 1, 0, 1, '', 0, '2024-07-16 08:00:47', 0),
(57, '33782', '$$F1f', 'Monthly', '2024-09-16 17:11:56', '', '', 1, 0, 0, '', 0, '2024-07-16 17:15:50', 0),
(58, '93357', 'mNK0$', 'Monthly', '2024-10-16 08:00:35', '', '', 1, 0, 1, '', 0, '2024-07-16 17:34:03', 0),
(59, '88209', 'NM77V', 'Daily', '2024-04-16 08:00:35', '00:E9:3A:10:92:F9', '192.168.1.102', 1, 0, 1, '09317', 0, '2024-07-16 17:43:41', 1),
(60, '33013', 'gIGqH', 'Weekly', '2024-07-16 08:00:38', '', '', 1, 0, 0, '', 0, '2024-07-16 08:00:47', 0),
(61, '06539', 'p*V7E', 'Monthly', '2024-07-15 20:34:58', '', '', 1, 0, 1, '', 0, '2024-07-15 20:34:58', 0),
(62, '02843', 'JN!6h', 'Daily', '2024-07-16 08:00:40', '', '', 1, 0, 1, '', 0, '2024-07-16 08:00:47', 0),
(63, '78655', 'EElU@', 'Weekly', '0000-00-00 00:00:00', '', '', 1, 0, 0, '', 0, '2024-07-15 20:46:08', 0),
(64, '47942', 'p@ZfC', 'Weekly', '2024-07-16 08:00:43', '', '', 1, 0, 1, '', 0, '2024-07-16 08:00:47', 0),
(65, '68640', '$%m0s', 'Daily', '2024-07-15 21:08:55', '', '', 1, 0, 1, '', 0, '2024-07-15 21:08:55', 0),
(66, '09317', '0BkPR', 'Daily', '2024-09-16 08:00:35', '00:E9:3A:10:92:F9', '192.168.1.102', 1, 0, 1, '36869', 0, '2024-07-16 08:00:47', 1),
(67, '05369', 'BNJSz', 'Daily', '2024-10-16 06:39:02', '00:E9:3A:10:92:F9', '192.168.1.102', 0, 0, 1, '36869', 0, '2024-07-16 06:39:14', 1),
(68, '36869', '@9%%k', 'Daily', '2024-07-17 10:00:00', '00:E9:3A:10:92:F9', '192.168.1.102', 0, 0, 1, '', 1, '0000-00-00 00:00:00', 1),
(69, '16310', '%cW6@', 'Monthly', '2024-08-16 10:00:00', '', '', 0, 0, 0, '', 0, '0000-00-00 00:00:00', 0),
(70, '47931', 'YKZvX', 'Daily', '2024-02-17 10:00:00', '0e:20:61:74:76:b1', '192.168.1.118', 1, 0, 1, '', 0, '0000-00-00 00:00:00', 1),
(71, '60264', 'j2gn5', 'Daily', '2024-07-17 10:00:00', 'd6:1c:4d:55:bc:04', '192.168.1.155', 0, 0, 1, '', 0, '0000-00-00 00:00:00', 0),
(72, '45667', 'HNqLC', 'Daily', '2024-07-17 10:00:00', '0e:20:61:74:76:b1', '192.168.1.118', 0, 0, 1, '', 0, '0000-00-00 00:00:00', 0),
(73, '83740', 'QvxJ3', 'Daily', '2024-07-17 10:00:00', '3e:e3:c5:ad:46:f1', '192.168.1.114', 0, 0, 1, '', 0, '0000-00-00 00:00:00', 0),
(74, '09273', 'E$s%N', 'Daily', '2024-07-17 10:00:00', '3c:7a:f0:99:9e:bc', '192.168.1.181', 0, 0, 1, '', 0, '0000-00-00 00:00:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('092g4PqAgrsV0kBkQuSDxcX2Nl5OWv0U', 1721240419, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-07-17T18:19:10.802Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"loginId\":\"36869\"}'),
('FXmjCP0b647tyNpvt6BUynAEk_Dzea2c', 1729367271, '{\"cookie\":{\"originalMaxAge\":8640000000,\"expires\":\"2024-10-19T19:47:50.519Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"loginId\":\"1234567890\"}'),
('NdzQq-mxVKj95Emqlkasv_wom50A_oDZ', 1721244189, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-07-17T19:23:06.299Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"loginId\":\"09273\"}'),
('TQELY3VQPxMOoOpjXcVfgnTVligS51si', 1721243709, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-07-17T19:15:07.930Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"loginId\":\"45667\"}'),
('ckyjxDyXQkQF7sjB07VuTf4A3FGMqYkS', 1721243465, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-07-17T19:08:48.934Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"loginId\":\"60264\"}'),
('uj3DFMN_E2cBwMmbZtPjMF6f5QHPWdOq', 1721244080, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-07-17T19:15:59.925Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"loginId\":\"83740\"}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `peopleconn`
--
ALTER TABLE `peopleconn`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `peopleconn`
--
ALTER TABLE `peopleconn`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
